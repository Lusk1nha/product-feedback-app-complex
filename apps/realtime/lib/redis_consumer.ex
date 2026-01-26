defmodule Realtime.RedisConsumer do
  use GenServer
  require Logger

  @redis_channel "feedback:created"

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_) do
    host = System.get_env("REDIS_HOST") || "localhost"
    port = String.to_integer(System.get_env("REDIS_PORT") || "6379")

    Logger.info("🔌 Elixir conectando ao Redis em #{host}:#{port}...")

    {:ok, conn} = Redix.PubSub.start_link(host: host, port: port, name: :redix_pubsub)
    {:ok, _ref} = Redix.PubSub.subscribe(conn, @redis_channel, self())

    {:ok, %{conn: conn}}
  end

  # 1. Mensagem de DADOS (O que importa pra nós)
  def handle_info({:redix_pubsub, _pid, _ref, :message, %{channel: @redis_channel, payload: payload}}, state) do
    Logger.info("🚀 [Redis] Recebido: #{payload}")

    case Jason.decode(payload) do
      {:ok, data} ->
        RealtimeWeb.Endpoint.broadcast("feedbacks:list", "new_feedback", data)
      _ ->
        Logger.error("❌ Erro JSON")
    end
    {:noreply, state}
  end

  # 2. Mensagem de INSCRIÇÃO (O recibo que estava crashando o app)
  def handle_info({:redix_pubsub, _pid, _ref, :subscribed, %{channel: channel}}, state) do
    Logger.info("✅ Confirmada inscrição no canal: #{channel}")
    {:noreply, state}
  end

  # 3. Catch-all (Para ignorar qualquer outra mensagem técnica do Redix e não crashar)
  def handle_info(_msg, state) do
    {:noreply, state}
  end
end
