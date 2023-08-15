class Game < ApplicationRecord
  validates :user_address, presence: true
  validates :bet_amount, presence: true, numericality: { equal_to: 0.01e18 } # 0.01 ETH in wei
  validates :choice, presence: true, inclusion: { in: ['heads', 'tails'] }
  # ... any other validations
end
