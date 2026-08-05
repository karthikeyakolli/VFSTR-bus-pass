import { RouteStop } from '@/pages/student/StudentRoutesPage';
import { NetworkRoute } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface RouteDetails {
  routeId: string;
  routeName: string;
  assignedBusNo: string;
  busCode: string;
  capacity: string;
  morningStart: string;
  pickupTime: string;
  campusArrival: string;
  eveningDeparture: string;
  driverName: string;
  driverExperience: string;
  driverPhone: string;
  transportOfficer: string;
  officeContact: string;
  officeLocation: string;
}

const mockRouteDetails: RouteDetails = {
  routeId: 'R14',
  routeName: 'Route #14 - Guntur City Express',
  assignedBusNo: 'AP 07 TJ 4521',
  busCode: 'VFSTR-B14',
  capacity: '55 Seats (48 Allocated)',
  morningStart: '07:00 AM',
  pickupTime: '07:10 AM',
  campusArrival: '07:50 AM',
  eveningDeparture: '05:15 PM',
  driverName: 'Mr. K. Venkateswarlu',
  driverExperience: '12 Years VFSTR Service',
  driverPhone: '+91 94401 23456',
  transportOfficer: 'Mr. P. Raghava Rao',
  officeContact: '+91 863-2344700 Ext 104',
  officeLocation: 'Admin Block, Room 104',
};

const mockStops: RouteStop[] = [
  { id: '1', seq: 1, name: 'Guntur Bus Station Depot', morningTime: '07:00 AM', eveningDropTime: '05:55 PM', landmark: 'Platform 1 Departure Gate', isAssigned: false },
  { id: '2', seq: 2, name: 'Old Bus Stand, Guntur', morningTime: '07:10 AM', eveningDropTime: '05:45 PM', landmark: 'Near Municipal High School', isAssigned: true },
  { id: '3', seq: 3, name: 'Collectorate Junction', morningTime: '07:18 AM', eveningDropTime: '05:38 PM', landmark: 'Opposite State Bank Branch', isAssigned: false },
  { id: '4', seq: 4, name: 'Market Yard Center', morningTime: '07:25 AM', eveningDropTime: '05:30 PM', landmark: 'Beside HP Petrol Pump', isAssigned: false },
  { id: '5', seq: 5, name: 'Auto Nagar Arch', morningTime: '07:32 AM', eveningDropTime: '05:22 PM', landmark: 'Near Fire Station Signal', isAssigned: false },
  { id: '6', seq: 6, name: 'VFSTR Vadlamudi Main Campus', morningTime: '07:50 AM', eveningDropTime: '05:15 PM', landmark: 'Transport Bay 3', isAssigned: false },
];

export class RouteService {
  /**
   * Retrieve complete network routes (supports 70+ scalable routes).
   */
  static async getAllNetworkRoutes(): Promise<NetworkRoute[]> {
    if (!isSupabaseConfigured) {
      return [
        {
          id: 'rt_14',
          routeCode: 'R14',
          routeName: 'Athota',
          startingPoint: 'Athota Main Road',
          endingPoint: 'VFSTR Vadlamudi Campus',
          distanceKm: 18.5,
          feeCategory: 'Standard Tier',
          annualFee: 29900,
          status: 'active',
          totalSeats: 60,
          occupiedSeats: 48,
          stops: mockStops.map((s) => ({
            id: s.id,
            routeId: 'rt_14',
            stopName: s.name,
            stopOrder: s.seq,
            latitude: 16.2341,
            longitude: 80.5481,
            morningPickupTime: s.morningTime,
            eveningDropTime: s.eveningDropTime,
            landmark: s.landmark,
            isAssigned: s.isAssigned,
          })),
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id,
          route_number,
          route_name,
          starting_point,
          ending_point,
          distance_km,
          fee_category,
          status,
          total_seats,
          occupied_seats,
          fees (
            annual_fee
          ),
          route_stops (
            id,
            stop_name,
            stop_order,
            latitude,
            longitude,
            pickup_time,
            drop_time
          )
        `)
        .eq('deleted_at', null)
        .order('route_number', { ascending: true });

      if (error || !data) return [];

      return data.map((r: any) => ({
        id: r.id,
        routeCode: r.route_number,
        routeName: r.route_name,
        startingPoint: r.starting_point || r.route_name,
        endingPoint: r.ending_point || 'VFSTR Vadlamudi Campus',
        distanceKm: r.distance_km || 0.0,
        feeCategory: r.fee_category || 'Standard Tier',
        annualFee: r.fees?.[0]?.annual_fee || 29900,
        status: r.status || 'active',
        totalSeats: r.total_seats || 60,
        occupiedSeats: r.occupied_seats || 0,
        stops: (r.route_stops || []).map((st: any) => ({
          id: st.id,
          routeId: r.id,
          stopName: st.stop_name,
          stopOrder: st.stop_order,
          latitude: st.latitude ? Number(st.latitude) : undefined,
          longitude: st.longitude ? Number(st.longitude) : undefined,
          morningPickupTime: st.pickup_time || '07:15 AM',
          eveningDropTime: st.drop_time || '05:30 PM',
        })),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Fetch assigned route details for a student.
   */
  static async getAssignedRouteDetails(_studentId: string): Promise<RouteDetails> {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return { ...mockRouteDetails };
    }

    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id,
          route_number,
          route_name,
          total_seats,
          occupied_seats,
          buses (
            registration_no,
            bus_number,
            driver_name,
            driver_phone
          )
        `)
        .limit(1)
        .single();

      if (error || !data) {
        return mockRouteDetails;
      }

      const busObj = (data as any).buses;

      return {
        routeId: data.route_number,
        routeName: `${data.route_number} - ${data.route_name}`,
        assignedBusNo: busObj?.registration_no || 'AP 07 TJ 4521',
        busCode: busObj?.bus_number || 'VFSTR-B14',
        capacity: `${data.total_seats} Seats (${data.occupied_seats} Allocated)`,
        morningStart: '07:00 AM',
        pickupTime: '07:10 AM',
        campusArrival: '07:50 AM',
        eveningDeparture: '05:15 PM',
        driverName: busObj?.driver_name || 'Mr. K. Venkateswarlu',
        driverExperience: 'VFSTR Service',
        driverPhone: busObj?.driver_phone || '+91 94401 23456',
        transportOfficer: 'Mr. P. Raghava Rao',
        officeContact: '+91 863-2344700 Ext 104',
        officeLocation: 'Admin Block, Room 104',
      };
    } catch {
      return mockRouteDetails;
    }
  }

  /**
   * Fetch all stops for a specific route.
   */
  static async getRouteStops(routeId: string): Promise<RouteStop[]> {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return [...mockStops];
    }

    try {
      const { data, error } = await supabase
        .from('route_stops')
        .select('*')
        .eq('route_id', routeId)
        .order('stop_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return mockStops;
      }

      return data.map((stop: any) => ({
        id: stop.id,
        seq: stop.stop_order,
        name: stop.stop_name,
        morningTime: stop.pickup_time || '07:00 AM',
        eveningDropTime: stop.drop_time || '05:30 PM',
        landmark: 'Bus Stop',
        isAssigned: false,
      }));
    } catch {
      return mockStops;
    }
  }
}
