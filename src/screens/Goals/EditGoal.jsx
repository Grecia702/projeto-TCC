import { StyleSheet, View, Platform } from 'react-native'
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
import { useRoute } from '@react-navigation/native'

const CreateGoals = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useContext(colorContext);
    const { updateGoalsMutation } = useGoalsAuth();
    const toast = useToast();
    const [show, setShow] = useState(false);
    const route = useRoute();
    const { id, data } = route.params
    const [formatado, setFormatado] = useState(data.valor_meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    const [fields, setFields] = useState({ deadline: data.deadline });

    const onChange = (event, selectedDate) => {
        setShow(Platform.OS === 'ios');
        if (selectedDate) {
            setFields({ ...fields, deadline: selectedDate.toISOString() });
        }
    };

    const handleGoals = async () => {
        if (fields.valor_meta !== undefined && fields.valor_meta !== '') {
            if (fields.valor_meta <= 0) {
                toastError('Valor não pode ser igual a zero');
                return;
            }
        }

        if (fields.desc_meta !== undefined && fields.desc_meta !== '') {
            if (fields.valor_meta === '') {
                toastError('Preencha os campos obrigatórios');
                return;
            }
        }


        const updateData = {
            id: id,
            ...fields
        }

        updateGoalsMutation.mutate(updateData, {
            onSuccess: () => toastSuccess(),
            onError: (error) => toastError(error),
        });
    };

    const toastSuccess = () => {
        toast.show('Meta editada com sucesso', {
            type: 'success',
            duration: 3500,
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
                // value={format(fields.deadline, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                placeholder={format(fields.deadline, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                onPress={() => setShow(true)}
                required
            />
            {show && (
                <DateTimePicker
                    value={new Date(data.deadline)}
                    mode="date"
                    display="default"
                    minimumDate={startOfDay(addDays(new Date(), 1))}
                    onChange={onChange}
                />
            )}
            <CustomInput
                description={'Descrição da meta*'}
                type={'default'}
                value={fields.desc_meta ?? data.desc_meta ?? ''}
                placeholder={'Ex: Economias para as férias do final do ano'}
                onChangeText={(text) => setFields({ ...fields, desc_meta: text })}
                height={100}
                required
            />
            <ActionButtons
                onCancel={() => navigation.goBack()}
                onCreate={() => handleGoals()}
                cancelLabel="Voltar"
                createLabel="Atualizar"
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