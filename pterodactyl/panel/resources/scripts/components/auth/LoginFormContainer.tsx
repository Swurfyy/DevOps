import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const ACCENT_PURPLE = '#8b5cf6';
const ACCENT_CYAN = '#22d3ee';
const ACCENT_PINK = '#ec4899';
const BRAND_GRADIENT = `linear-gradient(145deg, ${ACCENT_PURPLE} 0%, ${ACCENT_CYAN} 45%, ${ACCENT_PINK} 100%)`;

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
    color: ${ACCENT_CYAN};
`;

const Card = styled.div`
    ${tw`flex flex-col md:flex-row w-full rounded-3xl overflow-hidden mx-1`};
    background: rgba(10, 14, 30, 0.85);
    border: 1px solid rgba(139, 92, 246, 0.28);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(34, 211, 238, 0.08);
    backdrop-filter: blur(12px);
`;

const BrandingPanel = styled.div`
    ${tw`flex flex-col items-center justify-center text-center gap-4 py-8 px-8 md:px-10 relative`};
    background-image: ${BRAND_GRADIENT};
    color: #ffffff;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        inset: 12% 14%;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 24px;
        opacity: 0.6;
    }

    ${breakpoint('md')`
        ${tw`w-2/5`}
    `};
`;

const BrandingTag = styled.span`
    ${tw`uppercase text-xs font-semibold`};
    letter-spacing: 0.35em;
    opacity: 0.85;
`;

const BrandingTitle = styled.h3`
    ${tw`text-3xl font-semibold`};
    letter-spacing: 0.05em;
    text-shadow: 0 8px 26px rgba(0, 0, 0, 0.35);
`;

const BrandingSubtitle = styled.p`
    ${tw`text-sm leading-relaxed`};
    max-width: 18rem;
    opacity: 0.9;
`;

const BrandingNote = styled.p`
    ${tw`text-xs uppercase tracking-wide`};
    opacity: 0.8;
`;

const FormPanel = styled.div`
    ${tw`flex-1 p-6 md:p-10`};
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    background: linear-gradient(155deg, rgba(11, 17, 33, 0.9) 0%, rgba(12, 20, 43, 0.94) 65%);
`;

const FooterText = styled.p`
    ${tw`text-center text-xs mt-4`};
    color: rgba(255, 255, 255, 0.55);

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
                    <BrandingTag>Galactic control</BrandingTag>
                    <BrandingTitle>EclipseMC Panel</BrandingTitle>
                    <BrandingSubtitle>Een strak, modern paneel in een donker, galactisch thema.</BrandingSubtitle>
                    <BrandingNote>DevOps project van Zendé, André, Daniel & Lukas</BrandingNote>
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
