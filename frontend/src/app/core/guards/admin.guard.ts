import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { ToastService } from '../../shared/components/toast/toast.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (tokenService.isLoggedIn()) {
    const user = tokenService.getUserInfo();
    if (user && user.roles.includes('ROLE_ADMIN')) {
      return true;
    } else {
      toastService.error('Unauthorized', 'You do not have permission to access the admin panel.');
      router.navigate(['/dashboard']);
      return false;
    }
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
