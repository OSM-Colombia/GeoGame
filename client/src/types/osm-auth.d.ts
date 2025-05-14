declare module 'osm-auth' {
  export interface User {
    id: number;
    display_name: string;
    account_created: string;
    // (agrega más propiedades si es necesario)
  }
  export default function (config: { oauth_consumer_key: string; oauth_secret: string; oauth_url: string; auto?: boolean }): {
    authenticated(): boolean;
    user(): User;
    authenticate(callback: (err: Error, user: User) => void): void;
  };
} 