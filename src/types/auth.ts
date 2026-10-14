/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  termsAccepted: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  isNewUser?: boolean;
  error?: string;
  message?: string;
  previewCode?: string;
}
