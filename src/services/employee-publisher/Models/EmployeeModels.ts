export interface EmployeeInfoDto
{
    username?: string;

    /**  */
    employDate: Date;

    /**  */
    dismissalDate?: Date;

    /**  */
    directorateGuid?: string;

    /**  */
    governanceGuid?: string;

    /**  */
    groupGuid?: string;

    /**  */
    positionGuid?: string;

    leaderGuid?: string;
    
    isChief: boolean;

    info: EmployeeInfoDto;

    organizationStructure?: OrganizationStructureDto[];

    management_structure? : ManagementStructureElementDto[];

    guid: string;

    externalSyatemCode?: string
}

export interface EmployeeInfoDto
{
    lastName? : string;

    firstName? : string;

    middleName? : string;

    birthDay? : Date;

    outsource : boolean;

    outstaff : boolean;
    
    intern : boolean;

    absence? : AbsenceDto;

    contacts? : ContactsDto;

    photo?: PhotoDto;

    loaction?: LocationDto;
}

export interface AbsenceDto
{
    dateStart?: Date;
    dateEnd?: Date;
}

export interface ContactsDto
{
    mobileCorpNumber?: string;

    mobilePersonNumber?: string;

    extensionNumber?: string;

    email?: string;
}

export interface PhotoDto
{
    link?: string;
}

export interface LocationDto
{
    country?: string;

    city?: string;

    index?: string;

    address?: string;
}

export interface OrganizationStructureDto
{
    positionGuid: string;

    departmentGuid: string;

    companyGuid: string;

    isMain: boolean;
}

export interface ManagementStructureElementDto
{
    division : ManagementStructureDivisionDto;
}

export interface ManagementStructureDivisionDto
{
    name: string;

    uid: string;

    parent?: string;
}