#!/usr/bin/env python
# coding: utf-8

# In[1]:


import config as c, spotipy, spotipy.util as util, pandas as pd, pyperclip


# In[2]:


spotify = 'intializing for global'
def token(auth_scope='user-top-read'):
    # get api access for spotify
    username = 'blank'
    token = util.prompt_for_user_token(
           username=username,
           scope=auth_scope,
           client_id=c.client_id,
           client_secret=c.client_secret,
           redirect_uri=c.spot_banner)
    global spotify
    spotify = spotipy.Spotify(auth=token)
    user = spotify.current_user()
    display = user['display_name']
    username = user['id']
    print(f"""
    Success {display.split(" ")[0]}!
    """)
    return spotify, user, display, username    


# In[3]:


def preview(track_num=0,times=15):
    x = int(input('what track: '))
    preview =topTracks[x]['preview_url']
    browser = c.launch(preview)
    time.sleep(int(times))
    browser.quit()


# In[4]:


def change_user(new_username):
#   username = input('New Username: ')
    url = 'http://spotify.com'
    executable_path = {'executable_path': '/usr/local/bin/chromedriver'}
    browser = c.Browser('chrome', **executable_path, headless=False)
    browser.visit(url)
    browser.find_by_text('Log In').click()
    un = browser.find_by_name('username')
    browser.fill('username', new_username)
    print(username)
    return browser
    


# In[5]:

scope = 'user-top-read'
try:
    if tops:
        first = display_name.split(' ')[0]
        print(f"""
        Welcome {display_name}!  You got TOPS! """)
        print(f"Great!  Let's go.")
    else:
        tops,user,display_name,username = token(scope) 
except:
    tops,user,display_name,username = token(scope)


# In[6]:


def getTops():
    try:
        topTracks = tops.current_user_top_tracks(limit=50)['items']
        topArtists = tops.current_user_top_artists(limit=50)['items']
        print(f"We got {len(topTracks)} of your Top Tracks.")
        print(f"We got {len(topArtists)} of your Top Artists.")
    except:
        print("Maybe you're a new user??")
    return topTracks, topArtists


# In[7]:


topTracks, topArtists = getTops()


# In[51]:

mongo_name = display_name.replace(" ","_")

client, collection = c.mongo_me('spotify',mongo_name)
def drop_spot(username):
    client.spotify[username].drop()
    return client.spotify.list_collection_names()


# In[52]:


def post_Tracks(topTracks):
    print(f"""
    You are posting {len(topTracks)} tracks.
    It may take a moment.
    """)
    posts = []
    counter = 0
    for track in topTracks:
        counter +=1
        print(f" {round(counter/len(topTracks)*100,2)}%",end=' -')
        try:
            name = track['name']
            album = track['album']
            albumID = track['id']
            artistID = track['artists'][0]['id']
            post = {

                'list_type':'topTracks',

                'user':{
                    'username':username,
                    'display_name':display_name,
                },

                'track':{
                    'name':track['name'],
                    'pop':track['popularity'],
                    'id':track['id'],
                    'uri':track['uri'],
                    'preview':track['preview_url'],
                    'explicit':track['explicit'],
                    'features':tops.audio_features(track['id'])[0],
                    'recommended_tracks':[{'track':a['name'],'artist':a['artists'][0]['name'],'album':a['album']['name'],'id':a['uri']} for a in tops.recommendations(seed_artists=[artistID])['tracks']]


                },

                'album':{
                    'name':album['name'],
                    'id':album['id'],
                    'cover':album['images'][0],
                    'uri':album['uri'],
                    'release_date':album['release_date']                
                },

                'artist':tops.artist(artistID),
                'related':[{
                    'artist':a['name'],
                    'id':a['uri'],
                    'followers':a['followers']['total'],
                    'genres':a['genres']
                } for a in tops.artist_related_artists(artistID)['artists']]

            }
        except:
            print(f'X')
        
        posts.append(post)
               
    return posts


# In[53]:


songs = post_Tracks(topTracks)
print('Your songs have been formatted to post.')


# In[54]:


collection.insert_many(songs)
print('Your songs have been posted.')
print(f"""

You posted {len(songs)} to the Spotify DB under {collection.full_name}'s collection

---------------
Here is a list of all the Collections in the Spotify DB:
{client.spotify.list_collection_names()}

""")


# tracks = [doc['track']['name'] for doc in collection.find()]
# artists = [doc['artist']['name'] for doc in collection.find()]
# summary = pd.DataFrame([tracks,artists],index=['Track Name','Artist']).transpose().groupby('Artist',as_index=False).count().sort_values('Track Name',ascending=False).reset_index(drop=True)

# summary







