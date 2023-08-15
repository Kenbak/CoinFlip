class GamesController < ApplicationController
  before_action :set_server_secret, only: [:commit, :create]

  # This would be called before the user places a bet to get the commitment
  def commit
    @server_secret = SecureRandom.hex(16)
    commitment = Digest::SHA256.hexdigest(@server_secret)
    render json: { commitment: commitment }, status: :ok
  end

  def create
    game = Game.new(game_params)

     # Simulate sending 0.01 ETH to the contract
     logger.info "Received 0.01 ETH from #{game.user_address}"

    # Retrieve the server's secret for this game
    server_secret = session[:server_secret]

    # Generate the outcome using the server's secret
    srand(server_secret.hash)
    coin_flip = rand(2) == 1
    game.outcome = coin_flip

    # Calculate payout based on the outcome and house edge
    if coin_flip
      game.payout = game.bet_amount * 1.98 # Assuming a 2% house edge
    else
      game.payout = 0
    end

    if game.save
        # Simulate payout if user wins
        logger.info "Sent #{game.payout} ETH to #{game.user_address}" if game.outcome
      render json: game, status: :created
    else
      render json: game.errors, status: :unprocessable_entity
    end
  end

  private

  def set_server_secret
    session[:server_secret] ||= SecureRandom.hex(16)
  end

  def game_params
    params.require(:game).permit(:user_address, :bet_amount, :choice)
  end

end
