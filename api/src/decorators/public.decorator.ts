// This one is a simple decorator but, instead, it marks an endpoint as public,
// meaning that it can be accessed without a token. Useful for logins and other
// stuff.

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
