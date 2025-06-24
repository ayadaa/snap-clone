import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/common/Screen';
import { useAppDispatch } from '../../store/hooks';
import { clearUser } from '../../store/slices/auth.slice';
import { signOutUser } from '../../services/firebase/auth';

/**
 * Camera screen component - the heart of SnapClone.
 * Phase 0 implementation with placeholder UI and basic navigation elements.
 * Will be enhanced with Expo Camera integration in Phase 1.
 */
export function CameraScreen() {
  const dispatch = useAppDispatch();

  const handleProfilePress = () => {
    console.log('Profile pressed');
    // TODO: Navigate to profile screen
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      dispatch(clearUser());
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearchPress = () => {
    console.log('Search pressed');
    // TODO: Navigate to search/add friends screen
  };

  const handleCapturePress = () => {
    console.log('Capture pressed');
    // TODO: Implement camera capture functionality
  };

  const handleFlipCamera = () => {
    console.log('Flip camera pressed');
    // TODO: Implement camera flip functionality
  };

  const handleFlashToggle = () => {
    console.log('Flash toggle pressed');
    // TODO: Implement flash toggle functionality
  };

  return (
    <Screen backgroundColor="#000000" statusBarStyle="light-content">
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={handleProfilePress}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
              👤
            </Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              SnapClone
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                marginTop: 4,
                paddingHorizontal: 8,
                paddingVertical: 2,
                backgroundColor: 'rgba(255, 0, 0, 0.3)',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10 }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSearchPress}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Camera Preview Placeholder */}
        <View
          style={{
            flex: 1,
            backgroundColor: '#1A1A1A',
            margin: 20,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            📸
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Camera Preview
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            Phase 1: Expo Camera Integration
          </Text>
        </View>

        {/* Camera Controls */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 40,
            paddingBottom: 40,
          }}
        >
          {/* Flash Toggle */}
          <TouchableOpacity
            onPress={handleFlashToggle}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 20 }}>⚡</Text>
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            onPress={handleCapturePress}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 4,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#FFFFFF',
              }}
            />
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity
            onPress={handleFlipCamera}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 20 }}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
} 