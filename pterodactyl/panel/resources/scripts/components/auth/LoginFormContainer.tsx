import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const BRAND_ORANGE = '#f15a22';
const BRAND_TEAL = '#00a9b7';
const BRAND_GRADIENT = `linear-gradient(140deg, ${BRAND_TEAL} 0%, #12b4c3 42%, ${BRAND_ORANGE} 100%)`;

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 760px;
    `};
`;

const Title = styled.h2`
    ${tw`text-3xl text-center font-semibold py-4`};
    color: ${BRAND_ORANGE};
`;

const Card = styled.div`
    ${tw`flex flex-col md:flex-row w-full shadow-2xl rounded-3xl overflow-hidden mx-1`};
    background: #ffffff;
    border: 1px solid rgba(4, 26, 36, 0.05);
`;

const BrandingPanel = styled.div`
    ${tw`flex flex-col items-center justify-center text-center gap-4 py-8 px-6 md:px-10`};
    background-image: ${BRAND_GRADIENT};
    color: #ffffff;

    ${breakpoint('md')`
        ${tw`w-2/5`}
    `};
`;

const BrandingTag = styled.span`
    ${tw`uppercase text-xs font-semibold`};
    letter-spacing: 0.45em;
    opacity: 0.8;
`;

const BrandingTitle = styled.h3`
    ${tw`text-3xl font-semibold`};
    letter-spacing: 0.05em;
`;

const BrandingSubtitle = styled.p`
    ${tw`text-sm leading-relaxed`};
    max-width: 15rem;
    opacity: 0.9;
`;

const FormPanel = styled.div`
    ${tw`flex-1 bg-white p-6 md:p-10`};
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const FooterText = styled.p`
    ${tw`text-center text-xs mt-4`};
    color: rgba(255, 255, 255, 0.6);

    a {
        ${tw`no-underline`};
        color: inherit;

        &:hover {
            color: rgba(255, 255, 255, 0.85);
        }
    }
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        {title && <Title>{title}</Title>}
        <FlashMessageRender css={tw`mb-4 px-1`} />
        <Form {...props} ref={ref}>
            <Card>
                <BrandingPanel>
                    <BrandingTag>Thomas More</BrandingTag>
                    <BrandingTitle>Innovatie & DevOps</BrandingTitle>
                    <BrandingSubtitle>DevOps project: Zendé, Daniel, André en Lucas</BrandingSubtitle>
                </BrandingPanel>
                <FormPanel>{props.children}</FormPanel>
            </Card>
        </Form>
        <FooterText>
            &copy; 2015 - {new Date().getFullYear()}&nbsp;
            <a rel={'noopener nofollow noreferrer'} href={'https://pterodactyl.io'} target={'_blank'}>
                Pterodactyl Software
            </a>
        </FooterText>
    </Container>
));
