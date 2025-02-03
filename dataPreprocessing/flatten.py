import json

# Flatten JSON for BigQuery if needed
input_file = "baseballTeamScoresAndStandingsByDivision.json"

# Output file for the flattened NDJSON
output_file = "baseballTeamScoresAndStandingsByDivision.ndjson"

try:
    # Open and read the JSON file
    with open(input_file, "r") as f:
        data = json.load(f)

    # Extract the "teams" array
    teams = data.get("baseballTeamScoresAndStandingsByDivision", [])
    if not teams:
        print(f"No 'players' key found or it is empty in {input_file}")
        exit()

    # Write each object as a new line in the output file
    with open(output_file, "w") as f:
        for team in teams:
            f.write(json.dumps(team) + "\n")

    print(f"Flattened JSON written to {output_file}")

except FileNotFoundError:
    print(f"Error: The file {input_file} was not found.")
except json.JSONDecodeError:
    print(f"Error: The file {input_file} is not a valid JSON.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
