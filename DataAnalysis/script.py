import os
import json
import pandas as pd

userlog_path = "UserLog"
data = []
pd = {}
vd = {}

for user_folder in os.listdir(userlog_path):
    print(f'Processing {user_folder}')
    user_data = {}
    user_folder_path = os.path.join(userlog_path, user_folder)
    if os.path.isdir(user_folder_path):
        folder_number = int(user_folder[1:])
        # if folder_number % 2 == 0:
        for subdir, _, files in os.walk(user_folder_path):
            for file in files:
                file_path = os.path.join(subdir, file)
                if file == 'onboarding.json':
                    pass
                else:
                    video_data = {}
                    vd_data = {}
                    with open(file_path, 'r') as f:
                        bullet_points_data = json.load(f)
                    video_data['pauseCount'] = bullet_points_data['pauseCount']
                    video_data['forwardCount'] = bullet_points_data['forwardCount']
                    video_data['reverseCount'] = bullet_points_data['reverseCount']
                    video_data['point_count'] = len(bullet_points_data['editHistory'])
                    summary_t = bullet_points_data['summary_t']
                    summary_p = bullet_points_data['summary_p']
                    note_points = [bpd['point'] for bpd in bullet_points_data['editHistory']]
                    vd_data['p_id'] = user_folder
                    vd_data['note_points'] = note_points
                    vd_data['summary_p'] = summary_p
                    vd_data['summary_t'] = summary_t
                    if folder_number % 2 == 0:
                        if file.lower().startswith('video1'): 
                            user_data['noteeline*'] = video_data
                            vd_data['micronote'] = False
                            if 'video1' not in vd:
                                vd['video1'] = []
                            vd['video1'].append(vd_data)
                        elif file.lower().startswith('video2'): 
                            user_data['noteeline'] = video_data
                            vd_data['micronote'] = True
                            if 'video2' not in vd:
                                vd['video2'] = []
                            vd['video2'].append(vd_data)
                    else:
                        if file.lower().startswith('video1'): 
                            user_data['noteeline'] = video_data
                            vd_data['micronote'] = True
                            if 'video1' not in vd:
                                vd['video1'] = []
                            vd['video1'].append(vd_data)
                        elif file.lower().startswith('video2'): 
                            user_data['noteeline*'] = video_data
                            vd_data['micronote'] = False
                            if 'video2' not in vd:
                                vd['video2'] = []
                            vd['video2'].append(vd_data)
    data.append(user_data)

print('############ COUNT DATA ############')
for i, d in enumerate(data):
    print('----------------------------------------')
    print(f'User {i+1}')
    print(d)

print('\n############ VIDEO DATA ############')
for video in vd:
    print(f'--------------\n{video} data...\n--------------')
    for v in vd[video]:
        print(f"{v['p_id']}-{v['micronote']}-{v['summary_t']}-{v['summary_p']}")
        print(f"Notes: v['note_points']")
        print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    print()
