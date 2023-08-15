class AddChoiceToGames < ActiveRecord::Migration[7.0]
  def change
    add_column :games, :choice, :string
  end
end
