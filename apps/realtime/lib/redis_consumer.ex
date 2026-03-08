defmodule Realtime.RedisConsumer do
  use GenServer
  require Logger

  # 1. Trocamos a variável única por uma lista de canais
  @channels ["feedback:created", "feedback:updated", "feedback:deleted"]

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_) do
    host = "127.0.0.1"
    port = 6379

    Logger.info("🔌 Elixir conectando ao Redis em #{host}:#{port}...")
    {:ok, conn} = Redix.PubSub.start_link(host: host, port: port, name: :redix_pubsub)

    # 2. Iteramos sobre a lista e nos inscrevemos em TODOS os canais
    Enum.each(@channels, fn channel ->
      {:ok, _ref} = Redix.PubSub.subscribe(conn, channel, self())
    end)

    {:ok, %{conn: conn}}
  end

  def handle_info({:redix_pubsub, _pid, _ref, type, content}, state) do
    case {type, content} do
      # 3. MATCH PARA CRIAÇÃO
      {:message, %{channel: "feedback:created", payload: payload}} ->
        process_message(payload, "new_feedback")

      # 4. MATCH PARA ATUALIZAÇÃO
      {:message, %{channel: "feedback:updated", payload: payload}} ->
        process_message(payload, "update_feedback")

      # 5. MATCH PARA DELEÇÃO
      {:message, %{channel: "feedback:deleted", payload: payload}} ->
        process_message(payload, "delete_feedback")

      # Confirmação de Inscrição
      {:subscribed, %{channel: channel}} ->
        Logger.info("✅ Inscrição confirmada no canal: #{channel}")

      _ ->
        # Ignora silenciosamente outros eventos normais da biblioteca
        :ok
    end

    {:noreply, state}
  end

  # Catch-all para mensagens que NÃO são do Redis
  def handle_info(_msg, state) do
    {:noreply, state}
  end

  # --- FUNÇÕES PRIVADAS ---

  # 5. Função auxiliar que evita repetição de código
  defp process_message(payload, broadcast_event) do
    Logger.info("🚀 [Redis] Disparando evento #{broadcast_event}")

    case Jason.decode(payload) do
      {:ok, data} ->
        # Transmite para o Phoenix Channel com o nome do evento dinâmico
        RealtimeWeb.Endpoint.broadcast("feedbacks:list", broadcast_event, data)

      _ ->
        Logger.error("❌ Erro ao decodificar JSON do Redis")
    end
  end
end
