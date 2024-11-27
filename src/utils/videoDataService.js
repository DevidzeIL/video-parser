const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const TWITCH_CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.REACT_APP_TWITCH_CLIENT_SECRET;

let twitchOAuthToken = null;

const getYouTubeChannelData = async (channelId) => {
  const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const item = data.items[0];
    return {
      subscribers: item.statistics.subscriberCount || 'Недоступно',
      country: item.snippet.country || 'Недоступно',
    };
  } catch (error) {
    console.error('Ошибка при запросе к YouTube API:', error);
    return { subscribers: 'Недоступно', country: 'Недоступно' };
  }
};

const getYouTubeData = async (url) => {
  try {
    // Извлечение videoId из URL
    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) throw new Error('Неверный формат YouTube URL');

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const video = data.items[0];

    const channelId = video.snippet.channelId;
    const channelData = await getYouTubeChannelData(channelId);

    let videoType = 'Integration/Dedicated';
    if (url.includes('shorts')) {
      videoType = 'Shorts';
    }

    return {
      url: url,
      author_channel_url: `https://www.youtube.com/channel/${channelId}`,
      creation_date: video.snippet.publishedAt.split('T')[0],
      channel_title: video.snippet.channelTitle,
      subscribers: channelData.subscribers,
      country: channelData.country,
      title: video.snippet.title,
      views: video.statistics.viewCount,
      video_type: videoType,
    };
  } catch (error) {
    console.error('Ошибка при обработке YouTube URL:', error);
    return null;
  }
};

const getTwitchOAuthToken = async () => {
  const url = 'https://id.twitch.tv/oauth2/token';
  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials',
  });
  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'POST',
    });
    const data = await response.json();
    twitchOAuthToken = data.access_token;
  } catch (error) {
    console.error('Ошибка при получении OAuth токена:', error);
  }
};

const getTwitchChannelData = async (videoId) => {
  if (!twitchOAuthToken) {
    await getTwitchOAuthToken();
  }
  const headers = {
    'Client-ID': TWITCH_CLIENT_ID,
    Authorization: `Bearer ${twitchOAuthToken}`,
  };
  try {
    const videoResponse = await fetch(`https://api.twitch.tv/helix/videos?id=${videoId}`, {
      headers,
    });
    const videoData = await videoResponse.json();
    const videoInfo = videoData.data[0];
    const userId = videoInfo.user_id;

    const userResponse = await fetch(`https://api.twitch.tv/helix/users?id=${userId}`, {
      headers,
    });
    const userData = await userResponse.json();
    const userInfo = userData.data[0];

    const creationDate = videoInfo.created_at.split('T')[0];

    return {
      url: `https://www.twitch.tv/videos/${videoId}`,
      author_channel_url: `https://www.twitch.tv/${userInfo.login}`,
      creation_date: creationDate,
      channel_title: userInfo.display_name,
      subscribers: 'Недоступно',
      country: 'Недоступно',
      title: videoInfo.title,
      views: videoInfo.view_count,
      video_type: videoInfo.type === 'live' ? 'Stream' : 'Video',
    };
  } catch (error) {
    console.error('Ошибка при запросе к Twitch API:', error);
    return null;
  }
};

const getTwitchData = async (url) => {
  let videoIdMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
  if (!videoIdMatch) {
    videoIdMatch = url.match(/twitch\.tv\/.+\/video\/(\d+)/);
  }
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  if (videoId) {
    return await getTwitchChannelData(videoId);
  } else {
    console.error('Невозможно извлечь video_id из URL Twitch:', url);
    return null;
  }
};

export const getVideoData = async (url) => {
  if (url.includes('youtube')) {
    return await getYouTubeData(url);
  } else if (url.includes('twitch')) {
    return await getTwitchData(url);
  } else {
    console.error('Неизвестный URL:', url);
    return null;
  }
};
