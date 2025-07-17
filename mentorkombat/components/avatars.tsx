import { AvatarGroup } from "@/components/ui/avatar-group"

const Demo = () => {
    return (
        <>
            <AvatarGroup
                avatars={[                
                {
                    src: "https://svgl.app/library/github_dark.svg",
                    label: "Star on Github",
                    url: "https://github.com/IgorBlink/Mentor-Kombat/stargazers",
                },
                {
                    src: "https://avatars.githubusercontent.com/u/178751420?v=4",
                    label: "Aziz Gabitov",
                    url: "https://github.com/azekowka",
                },
                {
                    src: "https://avatars.githubusercontent.com/u/165867923?v=4",
                    label: "Igor Blink",
                    url: "https://github.com/igorblink",
                },

                ]}
                maxVisible={4}
                size={45}
            />
        </>
    )
}

export {Demo}