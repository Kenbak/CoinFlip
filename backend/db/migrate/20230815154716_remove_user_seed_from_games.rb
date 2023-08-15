class RemoveUserSeedFromGames < ActiveRecord::Migration[7.0]
  def change
    remove_column :games, :user_seed, :string
  end
end
