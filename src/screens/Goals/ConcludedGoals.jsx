import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native'
import { useContext, useState } from 'react'
import { colorContext } from '@context/colorScheme';
import { useGoals } from '@hooks/useGoals';
import { useGoalsAuth } from '@context/goalsContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Goals from '@components/goals';
import { Provider } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import DangerModal from '@components/dangerModal';

const ConcludedGoals = () => {
    const { isDarkMode } = useContext(colorContext)
    const { data: goalsData } = useGoals({ total: true, status_meta: 'concluida' })
    const [dropdownVisibleId, setDropdownVisibleId] = useState(null);
    const { deleteGoalsMutation, updateGoalsMutation } = useGoalsAuth();
    const [isOpen, setIsOpen] = useState(false)
    const toast = useToast();

    const handleDelete = (id) => {
        deleteGoalsMutation.mutate(id, {
            onSuccess: () => toastSuccess('Meta apagada com sucesso'),
            onError: (error) => toastError(error),
        });
    }

    const handleUpdateStatus = (id, title, message) => {
        const updateData = {
            id: id,
            status_meta: 'ativa',
            data_concluida: null
        }
        updateGoalsMutation.mutate(updateData, {
            onSuccess: () => toastSuccess(message),
            onError: (error) => toastError(error),
        });
    };

    const handleResume = (id, title) => {
        handleUpdateStatus(id, title, `Meta "${title}" foi retomada`);
    };

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

    return (
        <Provider>
            <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f7f7f8' }]}>
                <View style={styles.cardCarrousel}>
                    <View style={[styles.card, { backgroundColor: isDarkMode ? '#222' : '#fffefe', borderColor: isDarkMode ? '#333' : '#ccc' }]}>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                            <Text style={[styles.cardText, { color: isDarkMode ? '#aaa' : '#4d5e6f' }]}>
                                Metas Alcançadas
                            </Text>
                            <MaterialIcons name="savings" size={24} color={isDarkMode ? '#aaa' : '#4d5e6f'} />
                        </View>
                        <Text style={[styles.cardTextHighlight, { color: isDarkMode ? '#ccc' : '#101f31' }]}>
                            {goalsData?.total.total_ocorrencias || 0}
                        </Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: isDarkMode ? '#222' : '#fffefe', borderColor: isDarkMode ? '#333' : '#ccc' }]}>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                            <Text style={[styles.cardText, { color: isDarkMode ? '#aaa' : '#4d5e6f' }]}>
                                Total em Metas
                            </Text>
                            <MaterialIcons name="flag" size={24} color={isDarkMode ? '#aaa' : '#4d5e6f'} />
                        </View>
                        <Text style={[styles.cardTextHighlight, { color: isDarkMode ? '#ccc' : '#101f31' }]}>
                            {(goalsData?.total.total_economizado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Text>
                    </View>
                </View>
                {goalsData?.metas.length > 0 ? (
                    <FlatList
                        keyExtractor={(item) => item.id.toString()}
                        data={goalsData?.metas}
                        renderItem={({ item }) => (
                            <>
                                <View style={[styles.goalContainer, { backgroundColor: isDarkMode ? '#222' : '#fffefe', borderColor: isDarkMode ? '#333' : '#ccc' }]}>
                                    <Goals
                                        goal_desc={item.desc_meta}
                                        current_amount={item.saldo_meta}
                                        total_amount={item.valor_meta}
                                        complete_date={item.data_concluida}
                                        showOptions={true}
                                        status_meta={'concluida'}
                                        id={item.id}
                                        isVisible={dropdownVisibleId === item.id}
                                        setVisibleId={setDropdownVisibleId}
                                        editButton={() => navigation.navigate('Edit Goal', { id: item.id, data: item })}
                                        archiveButton={() => handleResume(item.id, item.desc_meta)}
                                        deleteButton={() => { setIsOpen(true); setDropdownVisibleId(null) }}
                                        archiveLabel={'Retomar'}
                                        addFunds={() => { setIsOpen({ ...open, funds_modal: true }) }}
                                    />
                                </View>
                                <DangerModal
                                    open={isOpen}
                                    setOpen={setIsOpen}
                                    onPress={() => { handleDelete(item.id); setIsOpen(false) }}
                                />
                            </>
                        )}
                    />
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 150 }}>
                        <Image
                            source={require('../../assets/no_data.png')}
                            style={{ width: 250, height: 250 }}
                        />
                        <Text style={{ fontSize: 18, fontWeight: '500', color: isDarkMode ? '#a1a1a1' : '#555' }}> Nada por aqui...</Text>
                    </View>
                )
                }
            </View>
        </Provider>
    )
}

export default ConcludedGoals

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#555',
        padding: 16,
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    cardCarrousel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#fff',
        height: 100,
        maxWidth: 220,
        alignSelf: 'center',
        justifyContent: 'center',
        elevation: 1,
        height: 100,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    cardText: {
        textAlign: 'left',
        fontSize: 16,
        fontWeight: '600',
    },
    cardTextHighlight: {
        textAlign: 'left',
        marginTop: 8,
        fontWeight: 'bold',
        fontSize: 18
    },
    goalContainer: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 25,
        marginTop: 24,
        gap: 24,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    buttonAdd: {
        alignSelf: 'center',
        borderRadius: 50,
        position: 'absolute',
        bottom: 20,
        right: 20
    }
})