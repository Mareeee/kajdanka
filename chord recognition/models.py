import torch
import torch.nn as nn
import numpy as np
from torch.utils.data import Dataset
from constants import CONTEXT_TOTAL, N_FEATURES


class FrameDataset(Dataset):
    def __init__(self, X, y, model_type="MLP"):
        self.X = X
        self.y = y
        self.model_type = model_type.upper()

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        x_np = np.array(self.X[idx], dtype=np.float32).copy()
        x = torch.from_numpy(x_np)
        if self.model_type == "CNN":
            x = x.view(1, CONTEXT_TOTAL, 12)
        label = int(self.y[idx])
        return x, label


class ChordCNN(nn.Module):
    def __init__(self, n_classes=25):
        super(ChordCNN, self).__init__()
        self.conv_block = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=(3, 3), padding=(1, 1)),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=(2, 2)),
            nn.Dropout2d(0.1),

            nn.Conv2d(32, 64, kernel_size=(3, 3), padding=(1, 1)),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=(2, 2)),
            nn.Dropout2d(0.15),
        )
        self.flatten = nn.Flatten()
        self.fc_out = nn.Sequential(
            nn.Linear(64 * 10 * 3, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(128, n_classes)
        )

    def forward(self, x):
        x = self.conv_block(x)
        x = self.flatten(x)
        x = self.fc_out(x)
        return x


class ChordMLP(nn.Module):
    def __init__(self, n_classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(N_FEATURES, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, n_classes)
        )

    def forward(self, x):
        return self.net(x)