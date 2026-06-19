import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    const baseUrl = 'http://localhost:8080/api';

    if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
        return next(req);
    }

    const apiReq = req.clone({
        url: `${baseUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`,
        withCredentials: true
    });

    return next(apiReq);
};