import {Header} from "../../../components";
import {ComboBoxComponent} from "@syncfusion/ej2-react-dropdowns";
import type { Route } from './+types/create-trip'


export const loader = async () => {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flag,flags,latlng,maps')

    if (!response.ok) {
        let details = ''
        try {
            // Try JSON first; fall back to text.
            const body = await response.json() as any
            details = body?.message ? String(body.message) : JSON.stringify(body)
        } catch {
            try {
                details = await response.text()
            } catch {
                details = ''
            }
        }
        throw new Response(
            `Failed to load countries (${response.status}${response.statusText ? ` ${response.statusText}` : ''})${details ? `: ${details}` : ''}`,
            { status: 502 }
        )
    }

    const data: unknown = await response.json()
    if (!Array.isArray(data)) {
        throw new Response('Unexpected countries API response (expected an array).', { status: 502 })
    }

    return data.map((country: any) => {
        const commonName = country?.name?.common ?? ''

        return ({
            name: commonName,
            // Emoji flags can fail to render inside some inputs; keep it for fallback/debug.
            flagEmoji: country?.flag,
            // Prefer an image URL for consistent rendering in the ComboBox.
            flagUrl: country?.flags?.png ?? country?.flags?.svg,
            coordinates: country?.latlng,
            value: commonName,
            // API uses `openStreetMaps` (plural).
            openStreetMap: country?.maps?.openStreetMaps
        })
    })
}

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
    const handleSubmit =  async () => {}
    const countries = loaderData as Country[]

    const countryData = countries.map((country) => ({
        text: country.name,
        value: country.value,
        flagUrl: country.flagUrl,
    })) as any[]

    return (
        <main className="flex flex-col gap-10 pb-20 wrapper">
            <Header title="Add a New Trips" description="View and edit AI-generated travel plans" />

            <section className="mt-2.5 wrapper-md">
                <form className="trip-form" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="country">
                            Country
                        </label>
                        <ComboBoxComponent
                            id="country"
                            dataSource={countryData}
                            fields={{ text: 'text', value: 'value' }}
                            placeholder="Select a Country"
                            className="combo-box"
                            itemTemplate={(item: any) => (
                                <div className="flex items-center gap-2">
                                    {item?.flagUrl ? (
                                        <img
                                            src={String(item.flagUrl)}
                                            alt=""
                                            className="h-4 w-6 rounded-sm object-cover ml-4"
                                            loading="lazy"
                                        />
                                    ) : null}
                                    <span>{item?.text}</span>
                                </div>
                            )}
                            valueTemplate={(item: any) => (
                                <div className="flex items-center gap-2">
                                    {item?.flagUrl ? (
                                        <img
                                            src={String(item.flagUrl)}
                                            alt=""
                                            className="h-4 w-6 rounded-sm object-cover"
                                            loading="lazy"
                                        />
                                    ) : null}
                                    <span>{item?.text}</span>
                                </div>
                            )}
                        />
                    </div>
                </form>
            </section>

        </main>
    )
}
export default CreateTrip
