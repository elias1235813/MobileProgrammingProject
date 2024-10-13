import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QuizResult() {
  // Reading game results which have been set by Quiz view when navigating here
  const { totalPoints, categoryId } = useLocalSearchParams();

  const [username, setUsername] = useState('');

  // Fetch the username from AsyncStorage when the component mounts
  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username'); // Retrieve username from storage
        if (storedUsername) {
          setUsername(storedUsername); // Set the username if found
        } else {
          Alert.alert('Error', 'Username not found');
        }
      } catch (error) {
        console.error('Error fetching username from storage:', error);
        Alert.alert('Error', 'An error occurred while fetching the username');
      }
    };

    getUsername();
  }, []); // Empty dependency array to ensure it runs once when the component mounts
  
  // State for showing leaderboard position and pesronal record
  const [ leaderboardPosition, setLeaderboardPosition ] = useState(null);
  const [ isPersonalRecord, setIsPersonalRecord ] = useState(false)
  
  // Sends user points to backend and sets leaderboard results to the UI
  async function postPlayerPoints(username, score, category, ) {
    try {
      const response = await fetch('https://quizzleapp.lm.r.appspot.com/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Telling backend it's receiving json
        },
        body: JSON.stringify({
          username,
          score: parseInt(score, 10),     // Ensure score is an integer
          category: parseInt(category, 10), // Ensure category is an integer
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Helps catching network errors or incorrect http status codes
      }
  
      const data = await response.json();
      // Process leaderboard and personal record from response
      console.log('Response data:', data);
      setLeaderboardPosition(data.leaderboardPosition);
      setIsPersonalRecord(data.isPersonalRecord);
    } catch (error) {
      console.error('Could not save leaderboard points', error);
    }
  }

    // When view initializes, sending game results to backend
    useEffect(() => {
      if (username && totalPoints && categoryId) {
        console.log('username:', username, 'totalPoints:', totalPoints, 'categoryId:', categoryId); // This is for debugging
        postPlayerPoints(username,totalPoints, categoryId);
      }
    }, [username, totalPoints, categoryId]); // Only run when username is fetched and totalPoints/categoryId are valid

  // Returns UI element which shows leaderboard-related information
  // Renders both leaderboard and personal record conditions
  const renderSpecialAchievements = () => {
    if (leaderboardPosition === -1) {
      return <Text style={styles.quizResultText}>😞 Sorry! 😞{"\n"}You didn't reach the leaderboard this time.</Text>;
    }

    if (leaderboardPosition !== null && isPersonalRecord) {
      return (
        
        <Text style={styles.quizResultText}>🏆 Double victory! 🏆{"\n"}You've set a new personal record and reached leaderboard position {leaderboardPosition}!{"\n"}Keep up the amazing work! 🎉</Text>
      );
    }

    if (leaderboardPosition !== null) {
      return <Text style={styles.quizResultText}>🎉 Congratulations! 🎉{"\n"}You've reached leaderboard position {leaderboardPosition}!</Text>;
    }

    if (isPersonalRecord) {
      return <Text style={styles.quizResultText}>🔥 It's a new personal record! 🔥{"\n"}Keep going!</Text>;
    }

    return null;
  };

  
  return (
    <View style={styles.container}>
      <View style={styles.contentContainerFull}>
        <Text style={styles.title}>Game ended</Text>
        
        <Text style={styles.quizResultText}>You got {totalPoints} points! 🎯</Text>
       {/* Display the special achievements message */}
       {renderSpecialAchievements()}

        {/* A button for playing a new game */}
        <View style={styles.startButtonContainer}>
          <View style={styles.button}>
            <Link
              style={styles.buttonText}
              href={{
                pathname: '/createQuiz',
              }}>
                    Play again
            </Link>
          </View>
        </View>
      </View>        
    </View>
  );
}