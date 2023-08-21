import styled from '@emotion/styled';
import Grid from './Components/Grid';

const StyledGrid = styled(Grid)`
    background-color: #eeeeee22;
`;

export default function App() {
    return <StyledGrid lineWidth={.1} />;
}
