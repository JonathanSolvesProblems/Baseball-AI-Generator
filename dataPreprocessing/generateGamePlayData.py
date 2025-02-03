import requests
import json

# URL for the MLB schedule API for a specific season
def get_schedule_url(season):
    return f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&season={season}"

# Function to fetch the schedule data for a given season
def fetch_schedule_data(season):
    schedule_url = get_schedule_url(season)
    response = requests.get(schedule_url)
    return response.json()

# Function to fetch game data for a given gamePk
def fetch_game_data(game_pk):
    game_feed_url = f'https://statsapi.mlb.com/api/v1.1/game/{game_pk}/feed/live'
    response = requests.get(game_feed_url)
    return response.json()

# Function to fetch and save game data + play-by-play data for a given season
def fetch_and_save_game_data(season, max_entries=10000):
    all_game_data = []  
    all_play_data = [] 
    entry_count = 0 

    print(f"Fetching data for season {season}...")

    # Get the schedule data for the season
    schedule_data = fetch_schedule_data(season)

    # Loop through each date in the schedule
    for date in schedule_data.get('dates', []):
        for game in date.get('games', []):
            game_pk = game.get('gamePk')
            if not game_pk:
                continue

            print(f"Fetching data for gamePk {game_pk}")

            # Fetch the game data
            game_info_json = fetch_game_data(game_pk)

            # Extract and store general game data
            game_data = game_info_json.get('gameData', {})
            if game_data:
                all_game_data.append(game_data)
                entry_count += 1

            # Extract and store play-by-play data (current play)
            try:
                play_data = game_info_json['liveData']['plays']['currentPlay']
                if play_data:
                    all_play_data.append(play_data)
            except KeyError:
                print(f"No play data found for gamePk {game_pk}")

            # Stop if max_entries limit is reached
            if entry_count >= max_entries:
                print(f"Reached {max_entries} entries for {season}. Stopping data collection.")
                break
        if entry_count >= max_entries:
            break

    # Save general game data
    game_filename = f"mlb_{season}_game_data.json"
    with open(game_filename, 'w') as json_file:
        json.dump({"gameData": all_game_data}, json_file, indent=4)
    print(f"Saved {entry_count} game records for {season} to {game_filename}")

    play_filename = f"mlb_{season}_single_game_play_data.json"
    with open(play_filename, 'w') as json_file:
        json.dump({"singleGamePlayData": all_play_data}, json_file, indent=4)
    print(f"Saved play-by-play data for {season} to {play_filename}")

def main():
    seasons = [2024, 2025]  
    for season in seasons:
        fetch_and_save_game_data(season)

if __name__ == "__main__":
    main()
