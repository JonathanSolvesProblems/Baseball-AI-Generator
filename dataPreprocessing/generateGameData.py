import requests
import json
import os


def get_schedule_url(season):
    return f"https://statsapi.mlb.com/api/v1/schedule?sportId=1&season={season}"

def fetch_schedule_data(season):
    schedule_url = get_schedule_url(season)
    response = requests.get(schedule_url)
    return response.json()


def fetch_game_data(game_pk):
    game_feed_url = f'https://statsapi.mlb.com/api/v1.1/game/{game_pk}/feed/live'
    response = requests.get(game_feed_url)
    return response.json()


def fetch_and_save_game_data(season, max_entries=10000):
    all_game_data = []  
    entry_count = 0 

    print(f"Fetching data for season {season}...")

    schedule_data = fetch_schedule_data(season)

    for date in schedule_data.get('dates', []):
   
        for game in date.get('games', []):
            game_pk = game.get('gamePk')
            if not game_pk:
                continue

            print(f"Fetching data for gamePk {game_pk}")

            # Fetch the game data
            game_info_json = fetch_game_data(game_pk)

            # Extract the gameData and append it to the list
            game_data = game_info_json.get('gameData', {})
            if game_data:
                all_game_data.append(game_data)
                entry_count += 1

            # Stop if max_entries limit is reached
            if entry_count >= max_entries:
                print(f"Reached {max_entries} entries for {season}. Stopping data collection.")
                break
        if entry_count >= max_entries:
            break

    # Define file name
    filename = f"mlb_{season}_game_data.json"

    # Save to JSON file
    with open(filename, 'w') as json_file:
        json.dump({"gameData": all_game_data}, json_file, indent=4)

    print(f"Saved {entry_count} game records for {season} to {filename}")


def main():
    seasons = [2024, 2025]

    for season in seasons:
        fetch_and_save_game_data(season)


if __name__ == "__main__":
    main()
