class GamesController < ApplicationController
  # This would be called before the user places a bet to get the commitment
  def commit
    commitment = generate_commitment
    render json: { commitment: commitment }, status: :ok
  end

  def index
    @games = Game.order(created_at: :desc).limit(5)
    render json: @games, status: :ok
  end

  def create
    game = Game.new(game_params)

    if game.save
      render json: game, status: :created
    else
      render json: game.errors, status: :unprocessable_entity
    end
  end

  private

  def generate_commitment
    server_secret = SecureRandom.hex(16)
    Digest::SHA256.hexdigest(server_secret)
  end

  def game_params
    params.require(:game).permit(:user_address, :bet_amount, :choice, :outcome)
  end
end
