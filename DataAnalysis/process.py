import json
import pandas as pd
 
# Extracting onbaording session data
onboarding_df = pd.read_json('onboarding.json')
print('Onboarding Session Data')
print(onboarding_df)
 
# Extracting bullet points data
with open('bulletPointsData.json', 'r') as file:
    bullet_points_data = json.load(file)
 
# - Data without edit history
bullet_points_columns = []
bullet_points_columns.append(bullet_points_data['buttonStats'])
bullet_points_columns[0]['pauseCount'] = bullet_points_data['pauseCount']
bullet_points_columns[0]['forwardCount'] = bullet_points_data['forwardCount']
bullet_points_columns[0]['reverseCount'] = bullet_points_data['reverseCount']
bullet_points_columns[0]['summary_p'] = ' ' if bullet_points_data['summary_p'] == '' else bullet_points_data['summary_p']
bullet_points_columns[0]['summary_t'] = ' ' if bullet_points_data['summary_t'] == '' else bullet_points_data['summary_t']
bullet_points_columns[0]['url'] = bullet_points_data['url']
 
bullet_points_df = pd.DataFrame(bullet_points_columns)
DataWithoutEditHistory = bullet_points_df.T
print('Data Without Edit History')
print(DataWithoutEditHistory)
 
# - Data with edit history
df = bullet_points_data['editHistory']
df = pd.DataFrame(df)
print('Data With Edit History')
print(df)

