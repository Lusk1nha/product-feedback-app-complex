defmodule Realtime.RedisConsumer do
  use GenServer
  require Logger

  @redis_channel "feedback:created"

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_) do
    # MUDANÇA 1: Forçando 127.0.0.1 para evitar problemas de DNS no Windows
    host = "127.0.0.1"
    port = 6379

    Logger.info("🔌 Elixir conectando ao Redis em #{host}:#{port}...")

    # Iniciamos o link
    {:ok, conn} = Redix.PubSub.start_link(host: host, port: port, name: :redix_pubsub)

    # Inscrevemos
    {:ok, _ref} = Redix.PubSub.subscribe(conn, @redis_channel, self())

    {:ok, %{conn: conn}}
  end

  # MUDANÇA 2: Debugger Supremo
  # Este bloco vai pegar QUALQUER mensagem do Redix e imprimir a estrutura bruta.
  # Isso vai nos mostrar se o "pattern matching" estava falhando antes.
  def handle_info({:redix_pubsub, _pid, _ref, type, content}, state) do
    Logger.warning("👀 [DEBUG] Mensagem crua recebida: Tipo=#{inspect(type)} | Content=#{inspect(content)}")

    case {type, content} do
      # Caso: Mensagem de DADOS
      {:message, %{channel: @redis_channel, payload: payload}} ->
        Logger.info("🚀 [Redis] Payload encontrado: #{payload}")

        case Jason.decode(payload) do
          {:ok, data} ->
            RealtimeWeb.Endpoint.broadcast("feedbacks:list", "new_feedback", data)
          _ ->
            Logger.error("❌ Erro ao decodificar JSON")
        end

      # Caso: Confirmação de Inscrição
      {:subscribed, %{channel: channel}} ->
        Logger.info("✅ Inscrição confirmada no canal: #{channel}")

      # Qualquer outra coisa
      _ ->
        Logger.info("🤔 Mensagem ignorada (Ping/Pong ou outro evento)")
    end

    {:noreply, state}
  end

  # Catch-all para mensagens que NÃO são do Redis (ex: sistema)
  def handle_info(msg, state) do
    Logger.warning("👻 Mensagem misteriosa recebida: #{inspect(msg)}")
    {:noreply, state}
  end
end
