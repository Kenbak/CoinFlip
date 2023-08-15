Rails.application.routes.draw do
  resources :games, only: [:create, :index]
end
