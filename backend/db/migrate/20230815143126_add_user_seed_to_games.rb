class AddUserSeedToGames < ActiveRecord::Migration[7.0]
  def change
    add_column :games, :user_seed, :string
  end
end
