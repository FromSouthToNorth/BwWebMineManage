interface BWSSOSDK {
  SSOLogin(
    hostname: string,
    port: string,
    callback: (data: Record<string, unknown> | null) => void
  ): void
  SSOLogout(hostname: string, port: string): void
}

declare var BW_SSO_SDK: BWSSOSDK
