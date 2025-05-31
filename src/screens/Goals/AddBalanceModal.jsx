import { StyleSheet, Text, View, Modal, TouchableOpacity, Pressable } from 'react-native'
import { colorContext } from '@context/colorScheme';
import { useContext, useState } from 'react'
import { useGoalsAuth } from '@context/goalsContext';
import CustomInput from '@components/customInput'
import { useToast } from 'react-native-toast-notifications';

const AddBalanceModal = ({ data, open, setOpen, onPress, confirmButton }) => {
    const { isDarkMode } = useContext(colorContext);
    const [fields, setFields] = useState();
    const { AddSaldoMutation } = useGoalsAuth();
    const toast = useToast();
    const [formatado, setFormatado] = useState(data.saldo_meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    const handleChange = (field, text) => {
        if (field === 'add_saldo') {
            const clean = text.replace(/\D/g, '');
            const valor = parseFloat(clean) / 100;
            setFields({ ...fields, [field]: isNaN(valor) ? 0 : valor });

            const f = (!isNaN(valor) ? valor : 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });

            setFormatado(f);
        } else {
            setFields({ ...fields, [field]: text });
        }

    };

    const AddSaldo = (id, saldo) => {
        if (saldo <= 0) {
            toastError('Valor inserido tem que ser maior que zero.');
            return
        }

        const updateData = { id: id, saldo: saldo };
        AddSaldoMutation.mutate(updateData, {
            onSuccess: () => toastSuccess('Saldo atualizado'),
            onError: (error) => toastError(error),
        });
    }

    const toastSuccess = (text) => {
        toast.show(text, {
            type: 'success',
            duration: 2500,
        });
    }
    const toastError = (text) => {
        toast.show(`${text}`, {
            type: 'error',
            duration: 1500,
        });
    }

    console.log(fields)

    return (
        <Modal
            transparent
            visible={open}
            animationType="fade"
            onRequestClose={setOpen}
        >
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={setOpen} />

                <View style={[styles.modal, { backgroundColor: isDarkMode ? "#333" : "#eeeeee" }]}>
                    <View>
                        <Text style={{ fontSize: 28, alignSelf: 'center', marginBottom: 32, fontWeight: '500', textAlign: 'center', color: isDarkMode ? "#FFF" : "#333" }}>
                            Adicionar Saldo
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={[styles.title, { fontWeight: '600', color: isDarkMode ? '#ddd' : '#333' }]}>
                            Descrição:
                        </Text>
                        <Text style={[styles.title, { color: isDarkMode ? '#ddd' : '#333', flexShrink: 1, textAlign: 'right' }]}>
                            {data.desc_meta}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[styles.title, { fontWeight: '600', color: isDarkMode ? '#ddd' : '#333' }]}>
                            Saldo Atual:
                        </Text>
                        <Text style={[styles.title, { color: isDarkMode ? '#ddd' : '#333' }]}>
                            {data.valor_meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Text>
                    </View>
                    <CustomInput
                        description={'Valor a adicionar:'}
                        type={'numeric-pad'}
                        value={formatado}
                        placeholder={'R$ 0,00'}
                        onChangeText={(text) => handleChange('add_saldo', text)}
                    />
                    <View style={{ flexDirection: 'column', gap: 16, justifyContent: 'space-between', alignSelf: 'stretch', paddingTop: 32 }}>
                        <TouchableOpacity
                            onPress={setOpen}
                            style={[styles.button, { backgroundColor: '#b8b6b6' }]}
                        >
                            <Text style={{ fontWeight: '500', fontSize: 20 }}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { AddSaldo(data.id, fields.add_saldo); setOpen() }}
                            style={styles.button}
                        >
                            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 20 }}>
                                {confirmButton || 'Adicionar Valor'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}
export default AddBalanceModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modal: {
        padding: 30,
        paddingHorizontal: 40,
        borderRadius: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 16,
    },
    button: {
        padding: 16,
        paddingHorizontal: 16,
        backgroundColor: '#456ab9',
        borderRadius: 5,
        alignItems: 'center'
    }
})