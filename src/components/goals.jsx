import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colorContext } from '@context/colorScheme';
import { useContext, useState } from 'react'
import CustomProgressBar from '@components/customProgressBar'
import { differenceInDays } from 'date-fns';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Menu } from 'react-native-paper';
import { format } from 'date-fns';

const Goals = ({
    goal_desc,
    end_date,
    complete_date,
    current_amount,
    status_meta,
    total_amount,
    showOptions,
    isVisible,
    setVisibleId,
    id,
    addBalanceButton,
    editButton,
    deleteButton,
    archiveButton,
    completeButton,
    archiveLabel
}) => {
    const { isDarkMode } = useContext(colorContext)
    const progress = current_amount / total_amount
    const valor_gasto = current_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const valor_total = total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const deadline = differenceInDays(end_date, new Date())
    let color = '#A0A0A0';
    let unfilledColor = '#E0E0E0';

    if (status_meta === 'parado') {
        color = isDarkMode ? '#504f4f' : '#A0A0A0';
        unfilledColor = isDarkMode ? '#7e7e7e' : '#E0E0E0';
    }
    if (status_meta === 'andamento') {
        color = isDarkMode ? '#66BB6A' : '#81C784';
        unfilledColor = isDarkMode ? '#424242' : '#D6EDD9';
    }

    if (status_meta === 'concluida') {
        color = isDarkMode ? '#034fa1' : '#007BFF';
        unfilledColor = isDarkMode ? '#486b92' : '#B3D7FF';
    }

    const handleToggleDropdown = () => {
        setVisibleId(isVisible ? null : id);
    };

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'flex-start', width: '100%' }}>
                <Text style={[styles.title, { color: isDarkMode ? '#cdcecd' : "#303030" }]}>
                    {goal_desc.charAt(0).toUpperCase() + goal_desc.slice(1)}
                </Text>
                {showOptions && (
                    <Menu
                        visible={isVisible}
                        onDismiss={handleToggleDropdown}
                        anchor={
                            <TouchableOpacity onPress={handleToggleDropdown} style={{ marginRight: -13, margin: 0, padding: 0 }}>
                                <MaterialIcons name="more-vert" size={24} color={isDarkMode ? '#cdcecd' : "#303030"} />
                            </TouchableOpacity>
                        }
                        style={{ marginTop: -80, marginLeft: -10 }}
                    >
                        {status_meta !== 'concluida' && (<Menu.Item onPress={addBalanceButton} title='Adicionar Saldo' />)}
                        <Menu.Item onPress={archiveButton} title={archiveLabel || 'Pausar Meta'} />
                        {status_meta !== 'concluida' && (<Menu.Item onPress={completeButton} title='Concluir Meta' />)}
                        <Menu.Item onPress={editButton} title="Editar" />
                        <Menu.Item onPress={deleteButton} title="Excluir" />
                    </Menu>
                )}
            </View>
            <View>
                <CustomProgressBar
                    height={25}
                    width={350}
                    color={color}
                    unfilledColor={unfilledColor}
                    progress={progress}
                />
                <Text style={styles.percent}>
                    {Math.round(progress * 100)}%
                </Text>
            </View>
            <Text style={[styles.desc, { color: isDarkMode ? '#cdcecd' : "#303030" }]}>{valor_gasto} de {valor_total}</Text>
            {status_meta !== 'concluida' ? (
                <Text style={[styles.title, { marginTop: 16, color: isDarkMode ? '#cdcecd' : "#303030" }]}>
                    {deadline > 0 ? `Expira em: ${deadline} dias` : `Expira em: menos de um dia`}
                </Text>
            ) : (
                <Text style={[styles.title, { marginTop: 16, color: isDarkMode ? '#cdcecd' : "#303030" }]}>
                    Concluida em: {format(complete_date, 'dd/MM/yyyy')}
                </Text>
            )
            }
        </View>

    )
}

export default Goals

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        alignSelf: 'center',
        padding: 8,
        position: 'relative'
    },
    title: {
        alignSelf: 'flex-start',
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 16
    },
    percent: {
        position: 'absolute',
        color: '#111812',
        right: 10,
        top: 2,
        fontWeight: 'bold'
    },
    desc: {
        alignSelf: 'flex-start',
        marginTop: 12,
    },
})