export function formatName(fullName: string): string {
	const parts = fullName.trim().split(/\s+/)

	if (parts.length < 2) {
		return fullName
	}

	const lastName = parts[0]
	const firstNameChar = parts[1][0].toUpperCase()

	const middleNameChar = parts[2] ? `${parts[2][0].toUpperCase()}.` : ''

	return `${lastName} ${firstNameChar}.${middleNameChar}`
}
