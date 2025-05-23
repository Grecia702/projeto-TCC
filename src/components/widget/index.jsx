import { SectionTitle } from "./styles";
import { Text, View, StyleSheet } from "react-native";
import { colorContext } from '@context/colorScheme';
import { useContext } from 'react'

export default function WidgetTeste({ Color, Title, TextColor, children, align, onPressDetails }) {
    const { isDarkMode } = useContext(colorContext)
    return (
        <View style={[styles.widget, { backgroundColor: Color }]}>
            <View style={styles.title}>
                <SectionTitle color={TextColor}>{Title}</SectionTitle>
                <Text
                    onPress={onPressDetails}
                    style={[styles.link, { color: isDarkMode ? '#3d91d6' : '#1675c2' }]}
                >
                    Ver mais
                </Text>
            </View>

            <View style={{ alignItems: align }} >
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    widget: {
        height: 'auto',
        flexDirection: 'column',
        borderRadius: 25,
        padding: 15,
        marginTop: 20,
        justifyContent: 'space-between',
        elevation: 3,
    },
    title: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        marginBottom: 32
    },
    link: {
        alignSelf: 'flex-end', textDecorationLine: 'underline', fontSize: 16, fontWeight: 'bold',
    },
})