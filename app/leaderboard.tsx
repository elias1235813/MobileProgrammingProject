import {useState, useEffect} from 'react';
import styles from './styles'; 
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null);     // For error handling
  const [selectedCategoryId, setSelectedCategoryId] = useState(0); // State for category
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'allUsers', title: 'All' },
    { key: 'currentUser', title: 'You' },
  ]);

  const [chosenView, setChosenView] = useState({
    allUsers: [],
    currentUser: [],
  });
  const [loadingView, setLoadingView] = useState({
    allUsers: true,
    currentUser: true
  });

  const categories = [
    { id: 0, name: 'All' },
    { id: 10, name: 'Books' },
    { id: 11, name: 'Films' },
    { id: 12, name: 'Music' },
    { id: 14, name: 'Television' },
    { id: 17, name: 'Science & Nature' },
    { id: 18, name: 'Computers' },
    { id: 19, name: 'Mathematics' },
    { id: 21, name: 'Sports' },
    { id: 22, name: 'Geography' },
    { id: 23, name: 'History' },
  ];

  

  // Function to fetch leaderboard data from the API. Filters the data by categoryid
  const fetchLeaderboard = async (categoryId = 0) => {
    try {
      setLoading(true); // Start loading
      let url = 'https://quizzleapp.lm.r.appspot.com/leaderboard';
      
      // Append the category ID to the URL
      url += `?category=${categoryId}`;
      console.log (url);
      

      const response = await fetch(url);
      const data = await response.json();
      setLeaderboard(data);
      
    } catch (error) {
      setError(error);
      Alert.alert('Error', 'Failed to fetch leaderboard data.');
    } finally {
      setLoading(false); // Stop loading when data is fetched or an error occurs
    }
  };

  // Fetch leaderboard when component mounts or when category changes
  useEffect(() => {
    fetchLeaderboard(selectedCategoryId);
  }, [selectedCategoryId]); // Trigger fetch when category changes

  // Key handler for FlatList
  const keyHandler = (item, index) => {
    return index.toString();
  };

  // Render leaderboard item
  const renderLeaderboard = ({ item, index }) => {
    return (
      <View style={styles.leaderboardItem}>
        <Text>{index + 1}. {item.username}</Text>
        <Text>{item.score} p</Text>
      </View>
    );
  };

  // Show loading spinner if data is being fetched
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

 // Create a component to render the leaderboard and picker view
 const renderLeaderboardView = () => (
  <View style={styles.container}>
    <View style={styles.contentContainerFull}>
      <Text style={styles.title}>TOP 10 scores</Text>
      {/* Picker to choose the category of the leaderboard */}
      <Text>From the category:</Text>
      <Picker
        selectedValue={selectedCategoryId}
        onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
      >          
        {categories.map(({ id, name }) => (<Picker.Item key={id} label={name} value={id} />  ))}
      </Picker>
      
      <FlatList style={styles.leaderboardStyle}
        keyExtractor={keyHandler}
        data={leaderboard}
        renderItem={renderLeaderboard}
      />
    </View>
  </View>
);

// Define scenes for each tab
const renderScene = SceneMap({
  allUsers: renderLeaderboardView,   // Same view for both tabs for now
  currentUser: renderLeaderboardView, // You can customize this view later for the current user
});

return (
  <TabView
    navigationState={{ index, routes }}
    renderScene={renderScene}
    onIndexChange={setIndex}
    initialLayout={{ width: '100%' }}
    renderTabBar={props => <TabBar {...props} />}
  />
);
};
