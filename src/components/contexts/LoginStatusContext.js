import { createContext } from "react";

/**
 * Auth context shape:
 * {
 *   isLoggedIn: boolean,
 *   token: string | null,
 *   user: { email: string, nickname?: string } | null,
 *   login: (payload: { email: string, password: string }) => Promise<void>,
 *   register: (payload: { email: string, password: string, nickname?: string }) => Promise<void>,
 *   logout: () => Promise<void>
 * }
 */
const LoginStatusContext = createContext(null);
export default LoginStatusContext;
