class CreateGames < ActiveRecord::Migration[7.0]
  def change
    create_table :games do |t|
      t.string :user_address
      t.decimal :bet_amount
      t.boolean :outcome
      t.decimal :payout

      t.timestamps
    end
  end
end
