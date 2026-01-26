defmodule RealtimeWeb.FeedbackChannel do
  use RealtimeWeb, :channel

  def join("feedbacks:list", _payload, socket) do
    {:ok, socket}
  end
end
