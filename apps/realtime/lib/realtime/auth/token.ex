defmodule Realtime.Auth.Token do
  use Joken.Config

  @impl true
  def token_config do
    # O leeway DEVE ser definido aqui dentro da configuração das claims!
    default_claims(
      skip: [:aud, :iss],
      # Adicionando tolerância de relógio (leeway) de 60 segundos
      default_exp_leeway: 60,
      default_iat_leeway: 60,
      default_nbf_leeway: 60
    )
    |> add_claim("sub", nil, &(&1 != nil))
  end

  def signer do
    secret = Application.get_env(:realtime, :jwt_secret) || "changeme"
    Joken.Signer.create("HS256", secret)
  end

  def verify_jwt(token) do
    # Voltamos a usar a função limpa, pois o leeway já está na configuração acima
    verify_and_validate(token, signer())
  end
end
