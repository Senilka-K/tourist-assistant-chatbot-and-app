import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useLanguage } from '../LanguageContext';
import i18n from '../I18n';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'French' },
    { code: 'es', label: 'Spanish' },
    { code: 'de', label: 'German' },
    { code: 'zh', label: 'Chinese' }
];

const LanguageSelectionScreen = () => {
    const { language, switchLanguage } = useLanguage();

    const handleLanguageChange = (code) => {
        switchLanguage(code); // Update the context
        i18n.changeLanguage(code); // Update i18next language setting
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => handleLanguageChange(item.code)}
        >
            <Text style={styles.text}>
                {item.label}
            </Text>
            {language === item.code && (
                <Text style={styles.tick}>
                    ✓
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Select a Language</Text>
            <FlatList
                data={languages}
                renderItem={renderItem}
                keyExtractor={(item) => item.code}
                extraData={language}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20
    },
    header: {
        fontSize: 24,
        marginBottom: 20
    },
    item: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 200,
        marginVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 5
    },
    text: {
        fontSize: 18
    },
    tick: {
        fontSize: 18,
        color: 'green'
    }
});

export default LanguageSelectionScreen;

