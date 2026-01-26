defmodule Realtime.Auth.Token do
  use Joken.Config

  @impl true
  def token_config do
    default_claims(skip: [:aud, :iss])
    |> add_claim("sub", nil, &(&1 != nil))
  end

  def signer do
    secret = System.get_env("JWT_ACCESS_SECRET") || "changeme"
    Joken.Signer.create("HS256", secret)
  end

  # MUDAMOS O NOME DE "verify" PARA "verify_jwt"
  def verify_jwt(token) do
    verify_and_validate(token, signer())
  end
end
