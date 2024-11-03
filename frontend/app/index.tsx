import { View, Text } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router';

export default function Index() {
    return <Redirect href="/(intro)/home" />;
}