import { View, TouchableOpacity, Text } from 'react-native';

const ActionButtons = ({ onCancel, onCreate, cancelLabel = "Cancelar", createLabel = "Criar", cancelColor = '#888888', createColor = '#0099cc' }) => {
    return (
        <View style={styles.buttonSection}>
            <TouchableOpacity
                onPress={onCancel}
                style={[styles.button, { backgroundColor: cancelColor }]}
            >
                <Text style={styles.buttonText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCreate}
                style={[styles.button, { backgroundColor: createColor }]}
            >
                <Text style={styles.buttonText}>{createLabel}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = {
    buttonSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'flex-end',
        width: 200,
        marginTop: 25,
    },
    button: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
};

export default ActionButtons;
