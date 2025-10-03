import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface TabIconProps {
    focused: boolean;
    icon: any;
    iconFocused: any;
    title: string;
}

interface ModalElementProps {
    href: string;
    text: string;
}


const TabIcon = ({ focused, icon, iconFocused, title }: TabIconProps) => {
    if (focused) {
        return (
            <View className='flex flex-row justify-center text-base/4 w-full min-w-[90px] items-center overflow-hidden'>
                <Ionicons name={iconFocused} className='text-2xl/6' size={21} />
                {title !== '' &&
                    <Text className='text-secondary text-base font-semibold ml-2'>{title}</Text>
                }
            </View>
        )
    }

    return (
        <View className='justify-center items-center'>
            <Ionicons name={icon} className='text-2xl/6' size={21} />
        </View>
    );
};

export default function TabLayout() {
    const [modalVisible, setAddNewThingsModalVisible] = useState(false);
    const router = useRouter();

    const handleMenuPress = (href?: string) => {
        setAddNewThingsModalVisible(false);
        if (href) {
            router.push(href as any);
        }
    };

    const ModalElement = ({ href, text }: ModalElementProps) => (
        <TouchableOpacity className='w-full items-center p-5' onPress={() => handleMenuPress(href)}>
            <Text className='text-lg text-blue-600'>{text}</Text>
        </TouchableOpacity>
    )

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        backgroundColor: "#d3d3d3",
                        borderRadius: 5,
                        marginHorizontal: 10,
                        borderWidth: 1,
                        borderColor: "#fff",
                        marginBottom: 10,
                        height: 40,
                        position: "absolute",
                        overflow: "hidden",
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused && !modalVisible} iconFocused={"home"} icon={"home-outline"} title="Home" />
                        ),
                    }}
                />
                {/* This is the fake tab for the '+' button */}
                <Tabs.Screen
                    name="add"
                    options={{
                        title: "Add",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={modalVisible} iconFocused={"add-circle-outline"} icon={"add"} title="Add" />
                        ),
                    }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                            setAddNewThingsModalVisible(true);
                        },
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: "Search",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused && !modalVisible} iconFocused={"search"} icon={"search-outline"} title="Search" />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused && !modalVisible} iconFocused={"person"} icon={"person-outline"} title="Profile" />
                        ),
                    }}
                />
            </Tabs>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => handleMenuPress()}
            >
                <Pressable
                    className='flex flex-1 justify-end bg-transparent/10'
                    onPress={() => handleMenuPress()}
                >
                    <View
                        className='m-5 bg-white b-20 rounded-xl items-center shadow-md shadow-black'>
                        <ModalElement href='/box/add' text='New box' />
                        <ModalElement href='/new-comment' text='New comment' />
                        <ModalElement href='/new-author' text='New author' />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}