import { StyleSheet, View, Platform, TouchableOpacity, Text } from 'react-native'
import { colorContext } from '@context/colorScheme';
import { useContext, useState, useMemo } from 'react'
import { useToast } from 'react-native-toast-notifications';
import { useNavigation } from '@react-navigation/native';
import ActionButtons from '@components/actionButtons';
import CustomInput from '@components/customInput';
import { useGoalsAuth } from '@context/goalsContext'
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CreateGoals = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useContext(colorContext);
    const { refetchGoals, createGoalsMutation } = useGoalsAuth();
    const toast = useToast();
    const date = startOfDay(new Date());
    const [show, setShow] = useState(false);
    const [formatado, setFormatado] = useState('R$ 0,00');
    const [fields, setFields] = useState({
        desc_meta: '',
        valor_meta: '',
        deadline: date,
        status_meta: 'ativa'
    });

    const onChange = (event, selectedDate) => {
        setShow(Platform.OS === 'ios');
        if (selectedDate) {
            setFields({ ...fields, deadline: selectedDate.toISOString() });
        }
    };

    const handleGoals = async () => {
        if (!fields.valor_meta || !fields.valor_meta || !fields.deadline) {
            toastError('Preencha os campos obrigatórios');
            return;
        }

        if (fields.valor_meta <= 0) {
            toastError('Valor inserido tem que ser maior que zero.');
            return;
        }

        createGoalsMutation.mutate(fields, {
            onSuccess: () => toastSuccess(),
            onError: (error) => toastError(error),
        });
    };

    const toastSuccess = () => {
        toast.show('Meta criada com sucesso', {
            type: 'success',
            duration: 2500,
        });
        navigation.goBack();
    }

    const toastError = (text) => {
        toast.show(`${text}`, {
            type: 'error',
            duration: 1500,
        });
    }

    const handleChange = (field, text) => {
        if (field === 'valor_meta') {
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


    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '	#e5e5ea' }]}>
            <CustomInput
                description={'Valor da meta*'}
                type={'numeric-pad'}
                value={formatado}
                onChangeText={(text) => handleChange('valor_meta', text)}
                required
            />
            <CustomInput
                description={'Data de vencimento*'}
                type={'date'}
                value={addDays(new Date(), 1)}
                placeholder={format(fields.deadline, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                onPress={() => setShow(true)}
                required
            />
            {show && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    minimumDate={startOfDay(addDays(new Date(), 1))}
                    onChange={onChange}
                />
            )}
            <CustomInput
                description={'Descrição da meta*'}
                type={'default'}
                value={fields.desc_meta}
                placeholder={'Ex: Economias para as férias do final do ano'}
                onChangeText={(text) => setFields({ ...fields, desc_meta: text })}
                height={100}
                required
            />
            <ActionButtons
                onCancel={() => navigation.goBack()}
                onCreate={() => handleGoals()}
                cancelLabel="Cancelar"
                createLabel="Criar"
                cancelColor="#8d8d8d"
            />
        </View>
    )
}

export default CreateGoals

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 10,
    },

})