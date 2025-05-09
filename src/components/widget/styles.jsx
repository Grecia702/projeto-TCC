import styled from "styled-components";


export const WidgetViewTeste = styled.View`
    height: auto;
    flex-direction:  ${({ direction = 'row' }) => direction};
    background-color: ${({ color }) => color};
    border-radius: 25px;
    padding: 15px;
    margin-top: 20px;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: ${({ gap = '15px' }) => gap};
`;

export const SectionTitle = styled.Text`
    font-size: 24px; 
    font-weight: 600;
    text-decoration: underline;
    color:  ${({ color }) => color};

`;

export const StyledScroll = styled.ScrollView.attrs(() => ({
    contentContainerStyle: {
        paddingVertical: 10,

    },
}))``;
