export declare class PlacementService {
    static getMyPlacement(userId: string): Promise<any>;
    static getAllPlacements(userId: string): Promise<any[]>;
    static createPlacement(data: {
        userId: string;
        organizationName: string;
        department?: string;
        positionTitle: string;
        location: string;
        supervisorName?: string;
        supervisorPhone?: string;
        supervisorEmail?: string;
        startDate: Date;
        endDate: Date;
        applicationId?: string;
        placementFee?: number;
    }): Promise<any>;
    static confirmPlacement(userId: string, placementId: string): Promise<any>;
    private static formatPlacement;
}
//# sourceMappingURL=placement.service.d.ts.map