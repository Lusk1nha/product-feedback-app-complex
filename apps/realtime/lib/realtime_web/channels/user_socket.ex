defmodule RealtimeWeb.UserSocket do
  use Phoenix.Socket
  require Logger

  ## Channels
  channel "feedbacks:*", RealtimeWeb.FeedbackChannel

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    case Realtime.Auth.Token.verify_jwt(token) do
      {:ok, claims} ->
        # Token Válido!
        user_id = claims["sub"] # "sub" é onde o NestJS guarda o ID por padrão
        Logger.info("✅ Usuário #{user_id} conectado via WebSocket")

        # Salvamos o ID no socket para usar depois (ex: autorizar canais específicos)
        {:ok, assign(socket, :current_user_id, user_id)}

      {:error, _reason} ->
        # Token Inválido ou Expirado
        Logger.warning("⛔ Tentativa de conexão WebSocket recusada: Token inválido")
        :error
    end
  end

  # Se o frontend tentar conectar sem mandar o param ?token=...
  @impl true
  def connect(_params, _socket, _connect_info) do
    Logger.error("⛔ Conexão recusada: Token não fornecido")
    :error
  end

  # Identificação do socket (Útil para desconectar usuário forçadamente depois)
  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user_id}"
end
