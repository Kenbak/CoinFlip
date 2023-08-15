namespace :sessions do
  desc "Clear out old session data"
  task cleanup: :environment do
    cutoff_time = Time.now - 30.days
    ActiveRecord::SessionStore::Session.where("updated_at < ?", cutoff_time).delete_all
  end
end
